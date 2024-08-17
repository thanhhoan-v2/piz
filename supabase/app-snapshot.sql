-- Create enums
create type privacy_mode as enum ('PUBLIC', 'PRIVATE');

create type follow_status as enum ('PENDING', 'ACCEPTED', 'REJECTED');

create type post_visibility as enum ('PUBLIC', 'FRIENDS_ONLY', 'JUST_ME');

create type content_type as enum ('POST', 'COMMENT');

create type reaction_type as enum ('LOVE', 'HATE');

create type notification_type as enum (
  'FOLLOW',
  'FOLLOW_SUGGEST',
  'TAG',
  'COMMENT',
  'REACT'
);

create type report_type as enum ('SPAM', 'HARASSMENT', 'INAPPROPRIATE');

create type attachment_format as enum ('AUDIO', 'IMAGE', 'VIDEO');

create type attachment_type as enum ('POST', 'COMMENT');

create type post_action_type as enum ('SAVE', 'IGNORE');

-- Create Tables
create table app_user (
  id UUID not null primary key,
  email TEXT not null unique,
  full_name TEXT not null unique,
  user_name TEXT not null unique,
  password TEXT not null,
  avatar_url TEXT unique,
  bio TEXT,
  is_active BOOLEAN default false,
  privacy_mode privacy_mode default 'PUBLIC',
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text),
  updated_at TIMESTAMPTZ,
  is_deleted BOOLEAN default false
);

create table follow (
  id SERIAL primary key,
  follower_id UUID references app_user (id) on delete cascade,
  followee_id UUID references app_user (id) on delete cascade,
  request_status follow_status default 'PENDING',
  followed_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text),
  accepted_at TIMESTAMPTZ,
  unique (follower_id, followee_id)
);

create table block (
  id SERIAL primary key,
  blocker_id UUID references app_user (id) on delete cascade,
  blocked_id UUID references app_user (id) on delete cascade,
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text),
  updated_at TIMESTAMPTZ
);

create table post (
  id SERIAL primary key,
  user_id UUID references app_user (id) on delete cascade,
  user_name TEXT references app_user (user_name),
  user_avatar_url TEXT references app_user (avatar_url),
  visibility post_visibility default 'PUBLIC',
  content TEXT not null,
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text),
  updated_at TIMESTAMPTZ,
  is_deleted BOOLEAN default false
);

create table comment (
  id SERIAL primary key,
  user_id UUID references app_user (id) on delete cascade,
  post_id SERIAL references post (id) on delete cascade,
  degree INTEGER default 0,
  parent_id SERIAL references comment (id) on delete cascade,
  content TEXT not null,
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text),
  updated_at TIMESTAMPTZ,
  is_deleted BOOLEAN default false
);

create table post_reaction (
  id SERIAL primary key,
  --- User who reacted
  user_id UUID references app_user (id) on delete cascade,
  --- Post which the reaction belongs
  post_id SERIAL references post (id) on delete cascade,
  --- Type of reaction
  reaction_type reaction_type,
  is_deleted BOOLEAN default false,
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text),
  updated_at TIMESTAMPTZ,
  constraint unique_post_reaction unique (user_id, post_id)
);

create table comment_reaction (
  id SERIAL primary key,
  --- User who reacted
  user_id UUID references app_user (id) on delete cascade,
  --- Comment which the reaction belongs
  comment_id SERIAL references comment (id) on delete cascade,
  --- Type of reaction
  reaction_type reaction_type,
  content_type content_type,
  is_deleted BOOLEAN default false,
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text),
  updated_at TIMESTAMPTZ,
  constraint unique_comment_reaction unique (user_id, comment_id)
);

create table share (
  id SERIAL primary key,
  sender_id UUID references app_user (id) on delete cascade,
  receiver_id UUID references app_user (id) on delete cascade,
  post_id SERIAL references post (id) on delete cascade,
  comment_id SERIAL references comment (id) on delete cascade,
  content_type content_type,
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text),
  is_deleted BOOLEAN default false
);

create table tag (
  id SERIAL primary key,
  tagger_id UUID references app_user (id) on delete cascade,
  tagged_id UUID references app_user (id) on delete cascade,
  post_id SERIAL references post (id) on delete cascade,
  comment_id SERIAL references comment (id) on delete cascade,
  content_type content_type,
  id_deleted BOOLEAN default false,
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text)
);

create table attachment (
  id SERIAL primary key,
  post_id SERIAL references post (id) on delete cascade,
  comment_id SERIAL references comment (id) on delete cascade,
  storage_url TEXT not null,
  sound_duration TEXT,
  attachment_type attachment_type,
  format attachment_format,
  is_deleted BOOLEAN default false,
  content_type content_type,
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text)
);

create table notification (
  id SERIAL primary key,
  sender_id UUID references app_user (id) on delete cascade,
  receiver_id UUID references app_user (id) on delete cascade,
  post_id SERIAL references post (id) on delete cascade,
  comment_id SERIAL references comment (id) on delete cascade,
  post_reaction_id SERIAL references post_reaction (id) on delete cascade,
  comment_reaction_id SERIAL references comment_reaction (id) on delete cascade,
  tag_id SERIAL references tag (id) on delete cascade,
  notification_type notification_type,
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text),
  is_read BOOLEAN default false
);

create table post_action (
  id SERIAL primary key,
  user_id UUID references app_user (id) on delete cascade,
  receiver_id UUID references app_user (id) on delete cascade,
  post_id SERIAL references post (id) on delete cascade,
  is_deleted BOOLEAN default false,
  action post_action_type
);

create table report (
  id SERIAL primary key,
  reporter_id UUID references app_user (id) on delete cascade,
  post_id SERIAL references post (id) on delete cascade,
  comment_id SERIAL references comment (id) on delete cascade,
  report_type report_type,
  content TEXT,
  content_type content_type,
  created_at TIMESTAMPTZ default (now() AT TIME ZONE 'utc' :: text)
);post_
