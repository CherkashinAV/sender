import {config} from '../config';
import nodemailer, {SendMailOptions} from 'nodemailer';

export class MailManager {
	private host: string;
	private port: number;

	constructor() {
		this.host = config['mail.host'];
		this.port = config['mail.port'];
	}

	async send(auth: {user: string, pass: string}, mailOptions:  SendMailOptions) {
		const transporter = nodemailer.createTransport({
			host: this.host,
			port: this.port,
			secure: true,
			logger: true,
			pool: true,
			auth
		});

		let sendResult;
		try {
			sendResult = await transporter.sendMail(mailOptions);
		} catch (error) {
			return {
				ok: false,
				error
			}
		}

		return {
			ok: true,
			value: sendResult
		}
	}
}

export const mailManager = new MailManager();
