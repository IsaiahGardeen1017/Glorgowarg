import { Application } from 'https://deno.land/x/oak/mod.ts';
import { Router } from 'https://deno.land/x/oak/mod.ts';

export async function startServer(port: number) {
	const app = new Application();
	const router = new Router();

	router.get('/api', (ctx) => {
		ctx.response.body = 'dynamic route worked';
	});

	app.use(async (ctx, next) => {
		try {
			await ctx.send({
				root: `${Deno.cwd()}/WebGraphics/WebRoot`,
				index: 'index.html',
			});
		} catch (_) {
			await next();
		}
	});

	app.use(router.allowedMethods());
	app.use(router.routes());

	console.log(`Listening on port ${port}`);
	await app.listen({ port: port });
}
