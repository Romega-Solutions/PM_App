section 1

| table_schema | table_name    | table_type |
| ------------ | ------------- | ---------- |
| public       | likes         | BASE TABLE |
| public       | messages      | BASE TABLE |
| public       | passes        | BASE TABLE |
| public       | profiles      | BASE TABLE |
| public       | typing_events | BASE TABLE |



section 2

| column_name     | data_type                | is_nullable | column_default     |
| --------------- | ------------------------ | ----------- | ------------------ |
| id              | uuid                     | NO          | uuid_generate_v4() |
| text            | text                     | YES         | null               |
| sender_id       | uuid                     | NO          | null               |
| recipient_id    | uuid                     | NO          | null               |
| type            | text                     | NO          | 'text'::text       |
| image_url       | text                     | YES         | null               |
| status          | text                     | NO          | 'sent'::text       |
| created_at      | timestamp with time zone | YES         | now()              |
| updated_at      | timestamp with time zone | YES         | now()              |
| is_deleted      | boolean                  | YES         | false              |
| delivery_method | text                     | YES         | 'database'::text   |
| read_at         | timestamp with time zone | YES         | null               |


section 3 none

section 4

| schemaname | tablename | policyname                          | permissive | roles    | cmd    | qual                                                      | with_check                                                                                                                                                                                                                                              |
| ---------- | --------- | ----------------------------------- | ---------- | -------- | ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | messages  | Users can delete their own messages | PERMISSIVE | {public} | UPDATE | (auth.uid() = sender_id)                                  | (is_deleted = true)                                                                                                                                                                                                                                     |
| public     | messages  | Users can insert their own messages | PERMISSIVE | {public} | INSERT | null                                                      | (auth.uid() = sender_id)                                                                                                                                                                                                                                |
| public     | messages  | Users can update their own messages | PERMISSIVE | {public} | UPDATE | ((auth.uid() = sender_id) OR (auth.uid() = recipient_id)) | (((auth.uid() = sender_id) AND (status = ANY (ARRAY['sending'::text, 'sent'::text, 'delivered'::text]))) OR ((auth.uid() = recipient_id) AND ((status = 'read'::text) OR (read_at IS NOT NULL))) OR ((auth.uid() = sender_id) AND (is_deleted = true))) |
| public     | messages  | Users can view their own messages   | PERMISSIVE | {public} | SELECT | ((auth.uid() = sender_id) OR (auth.uid() = recipient_id)) | null                                                                                                                                                                                                                                                    |

section 5 none


section 6
| id          | name        | public |
| ----------- | ----------- | ------ |
| chat-images | chat-images | true   |

section 7
| schemaname | tablename | policyname                        | permissive | roles    | cmd    |
| ---------- | --------- | --------------------------------- | ---------- | -------- | ------ |
| storage    | objects   | Anyone can view chat images       | PERMISSIVE | {public} | SELECT |
| storage    | objects   | Users can delete their own images | PERMISSIVE | {public} | DELETE |
| storage    | objects   | Users can upload their own images | PERMISSIVE | {public} | INSERT |

section 8

| routine_schema | routine_name                  | routine_type | return_type |
| -------------- | ----------------------------- | ------------ | ----------- |
| public         | cleanup_expired_typing_events | FUNCTION     | integer     |
| public         | cleanup_stale_presence        | FUNCTION     | integer     |
| public         | get_active_typing_indicators  | FUNCTION     | record      |
| public         | get_conversations_for_user    | FUNCTION     | record      |
| public         | handle_new_user               | FUNCTION     | trigger     |
| public         | handle_updated_at             | FUNCTION     | trigger     |
| public         | manual_verify_user            | FUNCTION     | record      |
| public         | periodic_presence_cleanup     | FUNCTION     | void        |
| public         | upsert_typing_event           | FUNCTION     | uuid        |


section 9
| trigger_name        | event_manipulation | event_object_table | action_statement                     | action_timing |
| ------------------- | ------------------ | ------------------ | ------------------------------------ | ------------- |
| messages_updated_at | UPDATE             | messages           | EXECUTE FUNCTION handle_updated_at() | BEFORE        |

section 10
| schemaname | tablename | indexname                          | indexdef                                                                                                                                                                                    |
| ---------- | --------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | messages  | messages_pkey                      | CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id)                                                                                                                       |
| public     | messages  | idx_messages_sender                | CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id, created_at DESC) WHERE (is_deleted = false)                                                                     |
| public     | messages  | idx_messages_recipient             | CREATE INDEX idx_messages_recipient ON public.messages USING btree (recipient_id, created_at DESC) WHERE (is_deleted = false)                                                               |
| public     | messages  | idx_messages_conversation          | CREATE INDEX idx_messages_conversation ON public.messages USING btree (sender_id, recipient_id, created_at DESC) WHERE (is_deleted = false)                                                 |
| public     | messages  | idx_messages_conversation_reverse  | CREATE INDEX idx_messages_conversation_reverse ON public.messages USING btree (recipient_id, sender_id, created_at DESC) WHERE (is_deleted = false)                                         |
| public     | messages  | idx_messages_unread                | CREATE INDEX idx_messages_unread ON public.messages USING btree (recipient_id, status) WHERE ((is_deleted = false) AND (status <> 'read'::text))                                            |
| public     | messages  | idx_messages_delivery_method       | CREATE INDEX idx_messages_delivery_method ON public.messages USING btree (delivery_method, created_at DESC) WHERE (is_deleted = false)                                                      |
| public     | messages  | idx_messages_read_at               | CREATE INDEX idx_messages_read_at ON public.messages USING btree (recipient_id, read_at) WHERE ((is_deleted = false) AND (read_at IS NOT NULL))                                             |
| public     | messages  | idx_messages_unread_delivery       | CREATE INDEX idx_messages_unread_delivery ON public.messages USING btree (recipient_id, status, delivery_method, created_at DESC) WHERE ((is_deleted = false) AND (status <> 'read'::text)) |
| public     | messages  | idx_messages_conversation_delivery | CREATE INDEX idx_messages_conversation_delivery ON public.messages USING btree (sender_id, recipient_id, delivery_method, created_at DESC) WHERE (is_deleted = false)                       |


section 11

no rows



section 12
| total_messages | unique_senders | first_message                 | last_message                  |
| -------------- | -------------- | ----------------------------- | ----------------------------- |
| 49             | 3              | 2025-12-01 14:53:07.034269+00 | 2025-12-19 14:11:18.916563+00 |


section 13
| column_name                       | data_type                | is_nullable | column_default |
| --------------------------------- | ------------------------ | ----------- | -------------- |
| id                                | uuid                     | NO          | null           |
| email                             | text                     | NO          | null           |
| first_name                        | text                     | NO          | null           |
| last_name                         | text                     | YES         | null           |
| user_type                         | text                     | NO          | null           |
| gender                            | text                     | YES         | null           |
| age                               | integer                  | YES         | null           |
| basic_info_completed              | boolean                  | YES         | false          |
| photos_completed                  | boolean                  | YES         | false          |
| location_completed                | boolean                  | YES         | false          |
| verification_completed            | boolean                  | YES         | false          |
| preferences_completed             | boolean                  | YES         | false          |
| created_at                        | timestamp with time zone | YES         | now()          |
| updated_at                        | timestamp with time zone | YES         | now()          |
| photos                            | ARRAY                    | YES         | '{}'::text[]   |
| location_type                     | text                     | YES         | null           |
| location_name                     | text                     | YES         | null           |
| location_coordinates              | jsonb                    | YES         | null           |
| location_timestamp                | timestamp with time zone | YES         | null           |
| verification_selfie               | text                     | YES         | null           |
| verification_document             | text                     | YES         | null           |
| verification_extracted_first_name | text                     | YES         | null           |
| verification_extracted_last_name  | text                     | YES         | null           |
| verification_extracted_age        | integer                  | YES         | null           |
| is_verified                       | boolean                  | YES         | false          |
| verified_at                       | timestamp with time zone | YES         | null           |
| verification_mismatch_reasons     | ARRAY                    | YES         | null           |
| interested_in                     | text                     | YES         | null           |
| age_min                           | integer                  | YES         | 18             |
| age_max                           | integer                  | YES         | 70             |
| max_distance_km                   | integer                  | YES         | 50             |
| relationship_goal                 | text                     | YES         | null           |
| is_online                         | boolean                  | YES         | false          |
| profile_photo                     | text                     | YES         | null           |
| last_seen                         | timestamp with time zone | YES         | now()          |
| is_active                         | boolean                  | YES         | true           |