import {dbClient} from '../lib/db-client';
import {logger} from '../lib/logger';
import {Template} from '../types';

type AddTemplateResult = {
	id: number;
	publicId: string;
}
export async function addTemplate(args: {
	name: string,
	theme: string,
	body: string
}): Promise<AddTemplateResult | null> {
    const query = `--sql
		INSERT INTO templates
		(name, theme, body)
		VALUES ($1, $2, $3)
		RETURNING id, public_id
	`;
	let publicId: string | null = null;
	let id: number | null = null;
    try {
        const {rows} =  await dbClient.query<{id: number, public_id: string}>(query, [args.name, args.theme, args.body]);
		publicId = rows[0].public_id;
		id = rows[0].id;

		if (id === null) {
			return null;
		}
    } catch (error) {
		logger.error(error);
        return null;
    }

    return {id, publicId};
}

export async function linkTemplateAndEmail(templateId: number, emailId: number) {
	try {
		await dbClient.query(
			`--sql
			INSERT INTO email_templates
			(email_id, template_id)
			VALUES ($1, $2)
		`,
			[emailId, templateId]
		);

		return true;
	} catch {
		return false;
	}
}

export async function hasLinkTemplate(templateId: number, emailId: number) {
	const {rows} = await dbClient.query(
        `--sql
		SELECT * FROM email_templates WHERE template_id = $1 AND email_id = $2;
	`,
        [templateId, emailId]
    );

	if (!rows || !rows.length) {
        return false;
    }

	return true;
}

export async function getTemplateByPublicId(publicId: string): Promise<Template | null> {
	const {rows} = await dbClient.query<Template>(
        `--sql
		SELECT * FROM templates WHERE public_id = $1;
	`,
        [publicId]
    );

    if (!rows || !rows.length) {
        return null;
    }
	
    return rows[0];
}