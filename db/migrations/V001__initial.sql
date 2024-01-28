CREATE EXTENSION pgcrypto;

CREATE TABLE templates (
	id SERIAL PRIMARY KEY,
	public_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	name text NOT NULL,
	body text NOT NULL,
	theme text NOT NULL
);

CREATE TABLE emails (
	id SERIAL PRIMARY KEY,
	email text NOT NULL,
	password text NOT NULL,
	secret_code text NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE email_templates (
	id SERIAL PRIMARY KEY,
	email_id integer REFERENCES emails (id),
	template_id integer REFERENCES templates (id)
);