"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = exports.Roles = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("./guards");
const Roles = (...roles) => (0, common_1.SetMetadata)(guards_1.ROLES_KEY, roles);
exports.Roles = Roles;
const common_2 = require("@nestjs/common");
exports.CurrentUser = (0, common_2.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
//# sourceMappingURL=decorators.js.map