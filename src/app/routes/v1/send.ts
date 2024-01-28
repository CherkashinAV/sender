import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {Request, Response} from 'express';
import {ApiError} from './api-error';
import {formatZodError} from './validators';
import {getTemplateByPublicId, hasLinkTemplate} from '../../storage/template';
import {getEmail} from '../../storage/emails';
import {cryptoManager} from '../../lib/crypto';
import {mailManager} from '../../lib/nodemailer';
import {substituteOptions} from '../../helpers';
import {logger} from '../../lib/logger';

const bodySchema = z.object({
	srcData: z.object({
		email: z.string().email(),
		secretCode: z.string()
	}),
	dstEmail: z.string().email(),
	templateId: z.string().uuid(),
	options: z.record(z.string()).optional()
});

export const sendHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	const template = await getTemplateByPublicId(body.templateId);

	if (!template) {
		throw new ApiError('NOT_FOUND', 404, 'No such template');
	}

	const emailData = await getEmail(body.srcData.email);
	if (!emailData) {
		throw new ApiError('NOT_FOUND', 404, 'No such emails for distribution');
	}

	if (!cryptoManager.validate(body.srcData.secretCode, emailData.secretCode)) {
		throw new ApiError('INVALID_SECRET', 401, 'Invalid secret code');
	}

	if (!await hasLinkTemplate(template.id, emailData.id)) {
		throw new ApiError('NOT_FOUND', 404, 'No such link for template and email');
	}

	const decodedPassword = cryptoManager.decodeData(emailData.password);

	if (!decodedPassword.ok) {
		throw new Error('Failed to decode password');
	}
	const text = substituteOptions(template.body, body.options)

	const sendResult = await mailManager.send({
		user: body.srcData.email,
		pass: decodedPassword.value!
	}, {
		from: body.srcData.email,
		to: `${body.dstEmail}`,
		subject: template.theme,
		text
	});

	if (!sendResult.ok) {
		return sendResult;
	}

	if (sendResult.value!.rejected.length > 0) {
		res.status(200).json({status: 'REJECTED'})
		return;
	}

	res.status(200).json({status: 'OK'});
});