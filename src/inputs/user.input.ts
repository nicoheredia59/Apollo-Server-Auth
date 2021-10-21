import {Field, InputType} from "type-graphql";

@InputType()
export class UserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  name: string;
}
