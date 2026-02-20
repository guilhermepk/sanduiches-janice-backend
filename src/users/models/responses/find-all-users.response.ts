import { PaginatedSearchResponse } from "src/common/responses/paginated-search.response";
import { UserEntity } from "../entities/user.entity";

export class FindAllUsersResponse extends PaginatedSearchResponse<UserEntity> { }