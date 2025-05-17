import { Injectable } from '@nestjs/common';
import { User } from 'src/users/dto/users.dto';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: 0,
      username: 'a@test.com',
      tag: 'IvanIvanov1986',
      password: 'root',
    },
    {
      userId: 2,
      username: 'b@test.com',
      tag: 'Tankist1994',
      password: 'root',
    },
  ];

  findOne(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }
}
