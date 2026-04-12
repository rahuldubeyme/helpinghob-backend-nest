import { Injectable, Logger } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { I18nService } from 'nestjs-i18n';

interface NotificationData {
  deviceToken: string | string[];
  title: string;
  description: string;
  metaData?: { [key: string]: any };
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private firebaseApp: firebaseAdmin.app.App;

  constructor(private readonly i18n: I18nService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Check if Firebase is already initialized
      if (firebaseAdmin.apps.length === 0) {
        const credPath = process.env.FCM_CREDENTIALS_PATH || './shared/fcm/fcm.json';
        
        try {
          const serviceAccount = require(credPath);
          
          this.firebaseApp = firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount),
          });
          
          this.logger.log('Firebase Admin initialized successfully');
        } catch (fileError) {
          this.logger.warn(
            `FCM credentials file not found at ${credPath}. Firebase notifications will be disabled. ` +
            `Please add your Firebase service account JSON file or set FCM_CREDENTIALS_PATH environment variable.`
          );
        }
      } else {
        this.firebaseApp = firebaseAdmin.app();
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error);
    }
  }


  async saveNotification(data: NotificationData): Promise<any> {
    if (!firebaseAdmin.apps.length) {
      this.logger.warn('Firebase not initialized. Notification not sent.');
      return { success: false, message: 'Firebase not configured' };
    }

    const { deviceToken, title, description, metaData = {} } = data;

    if (Array.isArray(deviceToken)) {
      return await this.bulkSendNotification(deviceToken, title, description, metaData);
    } else {
      return await this.sendNotification(deviceToken, title, description, metaData);
    }
  }


  async bulkSendNotification(
    tokens: string[],
    title: string,
    body: string,
    metaData: { [key: string]: any } = {},
  ): Promise<void> {
    if (!firebaseAdmin.apps.length) {
      this.logger.warn('Firebase not initialized. Bulk notification not sent.');
      return;
    }

    // Remove duplicates and empty tokens
    const validTokens = [...new Set(tokens.filter(token => token && token.trim() !== ''))];

    if (validTokens.length === 0) {
      this.logger.warn('No valid tokens provided for bulk notification');
      return;
    }

    // Split tokens into chunks of 300 (FCM multicast limit is 500, using 300 for safety)
    const chunkArray = (array: string[], size: number): string[][] => {
      const chunkedArr: string[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunkedArr.push(array.slice(i, i + size));
      }
      return chunkedArr;
    };

    const tokenChunks = chunkArray(validTokens, 300);

    // Send notifications to each chunk
    for (const chunk of tokenChunks) {
      try {
        const response = await firebaseAdmin.messaging().sendEachForMulticast({
          tokens: chunk,
          notification: {
            title: title || 'General Broadcast',
            body: body || 'General Message',
          },
          data: {
            title: title || 'Default Title',
            body: body || 'Default Body',
            metaData: JSON.stringify(metaData),
          },
          android: {
            priority: 'high',
          },
          apns: {
            headers: {
              'apns-priority': '10',
            },
            payload: {
              aps: {
                contentAvailable: true,
              },
            },
          },
        });

        this.logger.log(
          `Chunk sent: ${response.successCount} succeeded, ${response.failureCount} failed`
        );

        // Log failed tokens for debugging
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              this.logger.warn(`Failed to send to token ${chunk[idx]}: ${resp.error?.message}`);
            }
          });
        }
      } catch (error) {
        this.logger.error(`Error sending notification to chunk:`, error);
      }
    }
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    metaData: { [key: string]: any } = {},
  ): Promise<any> {
    if (!firebaseAdmin.apps.length) {
      this.logger.warn('Firebase not initialized. Notification not sent.');
      return { success: false, message: 'Firebase not configured' };
    }

    if (!token || token.trim() === '') {
      this.logger.warn('Invalid token provided for notification');
      return { success: false, message: 'Invalid token' };
    }

    const messageFormat = {
      token: token,
      notification: {
        title: title || 'Default Title',
        body: body || 'Default Body',
      },
      android: {
        priority: 'high' as const,
        notification: {
          title: title || 'Default Title',
          body: body || 'Default Body',
          sound: 'default',
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            alert: {
              title: title || 'Default Title',
              body: body || 'Default Body',
            },
            sound: 'default',
            contentAvailable: true,
          },
        },
      },
      data: {
        title: title || 'Default Title',
        body: body || 'Default Body',
        metaData: JSON.stringify(metaData),
      },
    };

    try {
      const response = await firebaseAdmin.messaging().send(messageFormat);
      this.logger.log('Notification sent successfully:', response);
      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error('Error sending notification:', error.message || error);
      return {
        success: false,
        message: this.i18n.t('validation.somethingWentWrong'),
        error: error.message,
      };
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    metaData: { [key: string]: any } = {},
  ): Promise<any> {
    if (!firebaseAdmin.apps.length) {
      this.logger.warn('Firebase not initialized. Topic notification not sent.');
      return { success: false, message: 'Firebase not configured' };
    }

    try {
      const message = {
        topic: topic,
        notification: {
          title: title || 'Default Title',
          body: body || 'Default Body',
        },
        data: {
          title: title || 'Default Title',
          body: body || 'Default Body',
          metaData: JSON.stringify(metaData),
        },
        android: {
          priority: 'high' as const,
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
        },
      };

      const response = await firebaseAdmin.messaging().send(message);
      this.logger.log(`Notification sent to topic ${topic}:`, response);
      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error(`Error sending notification to topic ${topic}:`, error);
      return {
        success: false,
        message: this.i18n.t('validation.somethingWentWrong'),
        error: error.message,
      };
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<any> {
    if (!firebaseAdmin.apps.length) {
      this.logger.warn('Firebase not initialized. Topic subscription failed.');
      return { success: false, message: 'Firebase not configured' };
    }

    try {
      const response = await firebaseAdmin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`Subscribed ${response.successCount} tokens to topic ${topic}`);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error(`Error subscribing to topic ${topic}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<any> {
    if (!firebaseAdmin.apps.length) {
      this.logger.warn('Firebase not initialized. Topic unsubscription failed.');
      return { success: false, message: 'Firebase not configured' };
    }

    try {
      const response = await firebaseAdmin.messaging().unsubscribeFromTopic(tokens, topic);
      this.logger.log(`Unsubscribed ${response.successCount} tokens from topic ${topic}`);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error(`Error unsubscribing from topic ${topic}:`, error);
      return { success: false, error: error.message };
    }
  }
}