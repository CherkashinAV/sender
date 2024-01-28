import z from 'zod';
import asyncMiddleware from 'middleware-async';
import {Request, Response} from 'express';
import {ApiError} from './api-error';
import {formatZodError} from './validators';
import {addTemplate, linkTemplateAndEmail} from '../../storage/template';
import {getEmail} from '../../storage/emails';
import {cryptoManager} from '../../lib/crypto';
import {logger} from '../../lib/logger';

const bodySchema = z.object({
	name: z.string(),
	srcEmail: z.string().email(),
	body: z.string(),
	theme: z.string(),
	secretCode: z.string().uuid()
});

export const addTemplateHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	const emailData = await getEmail(body.srcEmail);
	logger.error(emailData);
	if (!emailData) {
		throw new ApiError('NOT_FOUND', 404, 'No such emails for distribution');
	}

	if (!cryptoManager.validate(body.secretCode, emailData.secretCode)) {
		throw new ApiError('INVALID_SECRET', 401, 'Invalid secret code');
	}

	const templateData = await addTemplate(body);

	if (!templateData) {
		throw new Error('Insert failure.');
	}

	const linkResult = await linkTemplateAndEmail(templateData.id, emailData.id);

	if (!linkResult) {
		throw new Error('Insert failure.');
	}

	res.status(200).json({status: 'OK', publicId: templateData.publicId});
});