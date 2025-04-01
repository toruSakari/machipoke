import { builder } from '../schema';

// User型の定義
export const UserType = builder.objectRef<any>('User');

UserType.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    email: t.exposeString('email'),
    displayName: t.exposeString('displayName'),
    profileImageUrl: t.exposeString('profileImageUrl', { nullable: true }),
    hometown: t.exposeString('hometown', { nullable: true }),
    expertAreas: t.exposeStringList('expertAreas', { nullable: true }),
    bio: t.exposeString('bio', { nullable: true }),
    trustScore: t.exposeInt('trustScore'),
    createdAt: t.expose('createdAt', { type: 'Date' }),
    updatedAt: t.expose('updatedAt', { type: 'Date' }),
  }),
});

// ユーザー作成入力型
builder.inputType('CreateUserInput', {
  fields: (t) => ({
    email: t.string({ required: true, validate: { email: true } }),
    displayName: t.string({ required: true, validate: { minLength: 1, maxLength: 50 } }),
    profileImageUrl: t.string({ validate: { url: true } }),
    hometown: t.string(),
    expertAreas: t.stringList(),
    bio: t.string({ validate: { maxLength: 500 } }),
  }),
});

// ユーザー更新入力型
builder.inputType('UpdateUserInput', {
  fields: (t) => ({
    displayName: t.string({ validate: { minLength: 1, maxLength: 50 } }),
    profileImageUrl: t.string({ validate: { url: true } }),
    hometown: t.string(),
    expertAreas: t.stringList(),
    bio: t.string({ validate: { maxLength: 500 } }),
  }),
});
