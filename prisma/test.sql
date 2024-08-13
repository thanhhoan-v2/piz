-- Create enums
create type PRIVACY_MODE as enum ('PUBLIC', 'PRIVATE');
create type FOLLOW_STATUS as enum ('PENDING', 'ACCEPTED', 'REJECTED');
create type POST_VISIBILITY as enum ('PUBLIC', 'FRIENDS_ONLY', 'JUST_ME');
create type CONTENT_TYPE as enum ('POST', 'COMMENT');
create type REACTION_TYPE as enum ('LIKE', 'DISLIKE');
create type NOTIFICATION_TYPE as enum ('FOLLOW', 'FOLLOW_SUGGEST', 'TAG', 'COMMENT', 'REACT');
create type REPORT_TYPE as enum ('SPAM', 'HARASSMENT', 'INAPPROPRIATE');
create type ATTACHMENT_FORMAT as enum ('AUDIO', 'IMAGE', 'VIDEO');
create type ATTACHMENT_TYPE as enum ('POST', 'COMMENT');

-- Create tables
create table User (
    id UUID primary key,
    email TEXT not null unique,
    full_name TEXT not null unique,
    user_name TEXT not null unique,
    password TEXT not null,
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN default false,
    privacy_mode PRIVACY_MODE default 'PUBLIC',
    created_at TIMESTAMPTZ default now(),
    updated_at TIMESTAMPTZ
);

create table Follow (
    id UUID primary key,
    follower_id UUID references app_user(id) on delete cascade,
    followee_id UUID references app_user(id) on delete cascade,
    unique (follower_id, followee_id),
    status FOLLOW_STATUS default 'PENDING',
    followed_at TIMESTAMPTZ default now(),
    accepted_at TIMESTAMPTZ
);

create table Post (
    id UUID primary key,
    content TEXT not null,
    no_shares INTEGER default 0,
    user_id UUID references app_user(id) on delete cascade,
    visibility POST_VISIBILITY default 'PUBLIC',
    created_at TIMESTAMPTZ default now(),
    updated_at TIMESTAMPTZ,
    is_deleted BOOLEAN default false
);

create table Comment (
    id UUID primary key,
    content TEXT not null,
    user_id UUID references app_user(id) on delete cascade,
    post_id UUID references post(id) on delete cascade,
    parent_id UUID references comment(id) on delete cascade,
    level INTEGER default 0,
    created_at TIMESTAMPTZ default now(),
    updated_at TIMESTAMPTZ,
    is_deleted BOOLEAN default false
);

create table Tag (
    id UUID primary key,
    tagger_id UUID references app_user(id) on delete cascade,
    tagged_id UUID references app_user(id) on delete cascade,
    post_id UUID references post(id) on delete cascade,
    comment_id UUID references comment(id) on delete cascade,
    content_type CONTENT_TYPE,
    id_deleted BOOLEAN default false,
    created_at TIMESTAMPTZ default now()
);

create table Attachment (
    id UUID primary key,
    url TEXT not null,
    sound_duration TEXT,
    type ATTACHMENT_TYPE,
    format ATTACHMENT_FORMAT,
    is_deleted BOOLEAN default false,
    post_id UUID references post(id) on delete cascade,
    comment_id UUID references comment(id) on delete cascade,
    content_type CONTENT_TYPE,
    created_at TIMESTAMPTZ default now()
);

create table Reaction (
    id UUID primary key,
    user_id UUID references app_user(id) on delete cascade,
    type REACTION_type,
    is_deleted BOOLEAN default false,
    post_id UUID references post(id) on delete cascade,
    comment_id UUID references comment(id) on delete cascade,
    content_type CONTENT_TYPE,
    created_at TIMESTAMPTZ default now(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT unique_reaction unique (user_id, content_id, content_type)
);

create table Notification (
    id UUID primary key,
    sender_id UUID references app_user(id) on delete cascade,
    receiver_id UUID references app_user(id) on delete cascade,
    post_id UUID references post(id) on delete cascade,
    comment_id UUID references comment(id) on delete cascade,
    reaction_id UUID references reaction(id) on delete cascade,
    tag_id UUID references tag(id) on delete cascade,
    type NOTIFICATION_type,
    created_at TIMESTAMPTZ default now(),
    is_read BOOLEAN default false
);

create table SavedPost (
    id UUID primary key,
    user_id UUID references app_user(id) on delete cascade,
    post_id UUID references post(id) on delete cascade,
    created_at TIMESTAMPTZ default now(),
    is_deleted BOOLEAN default false
);

create table IgnoredPost (
    id UUID primary key,
    user_id UUID references app_user(id) on delete cascade,
    post_id UUID references post(id) on delete cascade,
    created_at TIMESTAMPTZ default now(),
    is_deleted BOOLEAN default false
);


create table Block (
    id UUID primary key,
    blocker_id UUID references app_user(id) on delete cascade,
    blocked_id UUID references app_user(id) on delete cascade,
    created_at TIMESTAMPTZ default now(),
    updated_at TIMESTAMPTZ
);

create table Report (
    id UUID primary key,
    reporter_id UUID references app_user(id) on delete cascade,
    type REPORT_type,
    message TEXT,
    post_id UUID references post(id) on delete cascade,
    comment_id UUID references comment(id) on delete cascade,
    content_type CONTENT_TYPE,
    created_at TIMESTAMPTZ default now()
);

-- create table shared_post (
--     id UUID primary key,
--     sender_id UUID references app_user(id) on delete cascade,
--     receiver_id UUID references app_user(id) on delete cascade,
--     post_id UUID references post(id) on delete cascade,
--     created_at TIMESTAMPTZ default now(),
--     is_deleted BOOLEAN default false
-- );
--
-- create table story (
--     id UUID primary key,
--     user_id UUID references app_user(id) on delete cascade,
--     content TEXT not null,
--     created_at TIMESTAMPTZ default now(),
--     expiration_time TIMESTAMPTZ
-- );
-- create table chat (
--     id UUID primary key,
--     first_user_id UUID references app_user(id) on delete cascade,
--     second_user_id UUID references app_user(id) on delete cascade,
--     is_deleted BOOLEAN default false,
--     color_scheme TEXT,
--     first_user_nickname TEXT,
--     second_user_nickname TEXT,
--     created_at TIMESTAMPTZ default now()
-- );
--
-- create table message (
--     id UUID primary key,
--     chat_id UUID references chat(id) on delete cascade,
--     sender_id UUID references app_user(id) on delete cascade,
--     receiver_id UUID references app_user(id) on delete cascade,
--     content TEXT not null,
--     created_at TIMESTAMPTZ default now(),
--     updated_at TIMESTAMPTZ,
--     is_deleted BOOLEAN default false,
--     is_read BOOLEAN default false
-- );
-- create table repost (
--     id UUID primary key,
--     user_id UUID references app_user(id) on delete cascade,
--     created_at TIMESTAMPTZ default now(),
--     content_type CONTENT_TYPE,
--     post_id UUID references post(id) on delete cascade,
--     comment_id UUID references comment(id) on delete cascade
-- );
-- create table Mute (
--     id UUID primary key,
--     muter_id UUID references app_user(id) on delete cascade,
--     muted_id UUID references app_user(id) on delete cascade,
--     muted_at TIMESTAMPTZ default now(),
--     updated_at TIMESTAMPTZ
-- );
