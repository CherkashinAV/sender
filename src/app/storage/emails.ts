import {dbClient} from '../lib/db-client';
import {EmailData} from '../types';


export async function getEmail(email: string): Promise<EmailData | null> {
	const {rows} = await dbClient.query(
        `--sql
		SELECT * FROM emails WHERE email = $1;
	`,
        [email]
    );

    if (!rows || !rows.length) {
        return null;
    }

    return {
		...rows[0],
		secretCode: rows[0].secret_code
	} as EmailData;
}

export async function addEmail(emailData: {
	email: string,
	password: string,
	secretCode: string
}): Promise<boolean> {
	try {
		await dbClient.query(`--sql
			INSERT INTO emails
			(email, password, secret_code)
			VALUES ($1, $2, $3)
		`,
			[emailData.email, emailData.password, emailData.secretCode]
		);

		return true;
	} catch {
		return false;
	}
}