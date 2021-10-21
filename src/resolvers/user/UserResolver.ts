import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";

import {User} from "../../entity/user.entity";
import {UserInput} from "../../inputs/user.input";
import {MyContext} from "../../types/MyContext";
import {UserResponse} from "../../errors/user.errors";

@InputType()
class EmailPasswordInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async getUsers() {
    return User.find();
  }

  @Query(() => User, {nullable: true})
  async me(@Ctx() {req}: MyContext) {
    if (!req.session.email) {
      return null;
    }

    return User.findOne(req.session.email);
  }

  @Mutation(() => User)
  async register(@Arg("options") options: UserInput): Promise<User> {
    const hasedPassword = await argon2.hash(options.password);

    const user = User.create({
      email: options.email,
      name: options.name,
      password: hasedPassword,
    }).save();

    return user;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: EmailPasswordInput,
    @Ctx() {req}: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({email: options.email});

    if (!user) {
      return {
        errors: [{field: "email", message: "email doesn't exists"}],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [{field: "password", message: "that password doesn't exists"}],
      };
    }

    req.session.email = user.email;
    return {user};
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() {req, res}: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie("qid");
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
