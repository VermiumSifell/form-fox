const WELCOMES = [
	"You're welcome!",
	"You're welcome! :fox:",
	"Of course!!",
	":D !!",
	"Eee! :orange_heart: :fox:"
];

const warnings = new Set();

module.exports = async (msg, bot)=>{
	if(msg.author.bot) return;
	var config = await bot.stores.configs.get(msg.channel.guild?.id);
	var prefix; 
	var match;
	var content;
	if(process.env.REQUIRE_MENTIONS) {
		if(msg.content.toLowerCase().startsWith(bot.prefix)) return await msg.channel.send('Eee! Please ping me to use commands!');
		prefix = new RegExp(`^<@!?(?:${bot.user.id})>`);
		match = msg.content.match(prefix);
		content = msg.content.replace(prefix, '');
	} else {
		prefix = (config?.prefix ? config.prefix : bot.prefix).toLowerCase();
		match = msg.content.startsWith(prefix);
		content = msg.content.slice(prefix.length);
	}
		
	if(!match?.length) {
		var thanks = msg.content.match(/^(thanks? ?(you|u)?|ty),? ?(form )?fox/i);
		if(thanks) return await msg.channel.send(WELCOMES[Math.floor(Math.random() * WELCOMES.length)]);
		return;
	}
	
	if(content == '') return msg.channel.send("Eee!");
	
	var log = [
		`Guild: ${msg.channel.guild?.name || "DMs"} (${msg.channel.guild?.id || msg.channel.id})`,
		`User: ${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
		`Message: ${msg.content}`,
		`--------------------`
	];

	let {command, args} = await bot.handlers.command.parse(content);
	if(!command) {
		log.push('- Command not found -');
		console.log(log.join('\r\n'));
		return await msg.channel.send("Command not found!");
	}
	
	try {
		await bot.handlers.command.handle({command, args, msg, config});
		await handleWarning(msg)
	} catch(e) {
		console.log(e);
		log.push(`Error: ${e}`);
		log.push(`--------------------`);
		await msg.channel.send('There was an error!')
	}
	console.log(log.join('\r\n'));
}

async function handleWarning(msg) {
	if(!process.env.COMMAND_WARN) return;
	if(warnings.has(msg.author.id)) return;
	warnings.add(msg.author.id);
	setTimeout(() => warnings.delete(msg.author.id), 1000 * 60 * 60 * 6) // show warning again after 6 hours
	await msg.channel.send(
		`⚠️ **Warning:** ⚠️\n` +
		`Text commands will be removed soon! ` +
		`For more information, please see this post: ` +
		`<https://www.patreon.com/posts/68150511>`
	)
}
