import asyncMiddleware from 'middleware-async';
import z from 'zod';
import {Request, Response} from 'express';
import {ApiError} from './api-error';
import {formatZodError} from './validators';
import {cryptoManager} from '../../lib/crypto';
import {addEmail} from '../../storage/emails';

const bodySchema = z.object({
	email: z.string().email(),
	password: z.string(),
	secretCode: z.string().uuid()
});

export const addEmailHandler = asyncMiddleware(async (req: Request, res: Response) => {
	const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
        throw new ApiError('BAD_REQUEST', 400, formatZodError(validationResult.error));
    }

    const body = validationResult.data;

	const secretEncodeResult = cryptoManager.encodeData(body.secretCode);
	const passwordEncodeResult = cryptoManager.encodeData(body.password);

	if(!secretEncodeResult.ok && !passwordEncodeResult.ok) {
		throw new Error('Encode failed');
	}

	const addEmailResult = addEmail({
		email: body.email,
		password: passwordEncodeResult.value!,
		secretCode: secretEncodeResult.value!
	})

	if (!addEmailResult) {
		throw new Error('Insert failed');
	}

	res.status(200).json({status: 'OK'});
});