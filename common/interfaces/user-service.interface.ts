export interface IUserService {
    findById(id: string): Promise<any>;
    sessionFindOne(query: { id: string; revoked: boolean }): Promise<any>;
}
