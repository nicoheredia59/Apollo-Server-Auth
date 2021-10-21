import {Field, ObjectType} from "type-graphql";
import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryColumn({unique: true})
  email: string;

  @Column()
  password: string;

  @Field()
  @Column()
  name: string;
}
