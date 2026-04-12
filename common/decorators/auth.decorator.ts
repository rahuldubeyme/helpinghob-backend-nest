import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAppUserAuthGuard } from '@guards/jwt-app-user-auth.guard';
import { RolesGuard } from '@guards/roles.guard';

export function Auth(...roles: (number | string)[]) {
    return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(JwtAppUserAuthGuard, RolesGuard),
        ApiBearerAuth(),
    );
}
