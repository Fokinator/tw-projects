(async function(Scratch){
	'use strict';
	
	const Cast = Scratch.Cast;
	const BlockType = Scratch.BlockType;
	const ArgType = Scratch.ArgumentType;
	
	const stringToArrayBuffer = str => {
		const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
		const bufView = new Uint16Array(buf);
		for (let i = 0, strLen = str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	};
	
	const arrayBufferToString = buf => {
		const bufView = new Uint16Array(buf);
		let resultString = '';
		for (let i = 0; i < bufView.length; i++) {
			resultString += String.fromCharCode(bufView[i]);
		}
		return resultString;
	};
	
	class Extension {
		getInfo() {
			return {
				id: "encryptDecrypt",
				name: "Encrypt & decrypt text",
				color1: '#555555',
				color2: '#333333',
				color3: '#000000',
				blocks: [
					{
						blockType: BlockType.LABEL,
						text: 'Key generator blocks'
					},
					
					{
						opcode: 'genKey',
						blockType: BlockType.REPORTER,
						text: 'generate encrypt/decrypt key; params: [PARAMS]'
					},
					
					{
						blockType: BlockType.LABEL,
						text: 'Key generator algorithm parameters:'
					},
					
					{
						opcode: 'createRsaOaepKeyGenParams',
						blockType: BlockType.REPORTER,
						text: 'create RSA-hashed key gen params; algorithm: [ALG] hash algorithm: [HASH_ALG]',
						arguments: {
							ALG: {
								type: ArgType.STRING,
								menu: 'RSAHASHED_KEYGEN_ALGORITHM_MENU'
							},
							HASH_ALG: {
								type: ArgType.STRING,
								menu: 'SHA'
							}
						}
					},
					{
						opcode: 'createEcKeyGenParams',
						blockType: BlockType.REPORTER,
						text: 'create EC key gen params; algorithm: [ALG] elliptic curve: [EC]',
						arguments: {
							ALG: {
								type: ArgType.STRING,
								menu: 'EC_KEYGEN_ALGORITHM_MENU'
							},
							EC: {
								type: ArgType.STRING,
								menu: 'ECKEYGENALG_ELLIPTIC_CURVES'
							}
						}
					},
					{
						opcode: 'createHmacKeyGenParams',
						blockType: BlockType.REPORTER,
						text: 'create HMAC key gen params; hash algorithm: [HASH_ALG]',
						arguments: {
							HASH_ALG: {
								type: ArgType.STRING,
								menu: 'SHA'
							}
						}
					},
//					{
//						opcode: 'createAesKeyGenParams',
//						blockType: BlockType.REPORTER,
//						text: 'create AES key gen params; algorithm: [ALG] length: [LENGTH]',
//						arguments: {
//							ALG: {
//								type: ArgType.STRING,
//								menu: 'AES_KEYGEN_ALGORITHM_MENU'
//							},
//							LENGTH: {
//								type: ArgType.NUMBER,
//								menu: 'AESKEYGENALG_LENGTH'
//							}
//						}
//					},					
					
					
					/////////////////////////////////
					
					{
						blockType: BlockType.LABEL,
						text: 'Encrypt/decrypt blocks'
					},
					{
						opcode: 'encrypt',
						blockType: BlockType.REPORTER,
						text: 'encrypt [TEXT] key: [KEY]',
						arguments: {
							TEXT: {
								type: ArgType.STRING,
								defaultValue: '{"username": "Idk_lol", "password": "1234566abcdef"}'
							}
						}
					},
					{
						opcode: 'decrypt',
						blockType: BlockType.REPORTER,
						text: 'decrypt [TEXT] key: [KEY]',
						arguments: {
							TEXT: {
								type: ArgType.STRING,
								defaultValue: ''
							}
						}
					},
					
					/////////////////////////////////
					
					{
						blockType: BlockType.LABEL,
						text: 'Encrypt/decrypt algorithms:'
					},
					
					
				],
				menus: {
					SHA: {
						acceptReporters: true,
						items: ['SHA-256', 'SHA-384', 'SHA-512']
					},
					
					/////////////////////////////////
					
					RSAHASHED_KEYGEN_ALGORITHM_MENU: {
						acceptReporters: true,
						items: ['RSASSA-PKCS1-v1_5', 'RSA-PSS', 'RSA-OAEP']
					},
					
					/////////////////////////////////
					
					EC_KEYGEN_ALGORITHM_MENU: {
						acceptReporters: true,
						items: ['ECDSA', 'ECDH']
					},
					ECKEYGENALG_ELLIPTIC_CURVES: {
						acceptReporters: true,
						items: ['P-256', 'P-384', 'P-521']
					},
					
					//////////////////////////////////////////////////////////////////////////////////
					// HMAC key gen algorithm has only one option (HMAC), so it doesn't need a menu //
					//////////////////////////////////////////////////////////////////////////////////
					
					
					AES_KEYGEN_ALGORITHM_MENU: {
						acceptReporters: true,
						items: ['AES-CTR', 'AES-CBC', 'AES-GCM', 'AES-KW']
					},
					AESKEYGENALG_LENGTH: {
						acceptReporters: true,
						items: [
							{
								text: '128',
								value: 128
							},
							{
								text: '192',
								value: 192
							},
							{
								text: '256',
								value: 256
							}
						]
					}
				}
			};
		}	
		
		createRsaOaepKeyGenParams({ALG, HASH_ALG}) {
			const algorithm = Cast.toString(ALG);
			const hashAlgorithm = Cast.toString(HASH_ALG);
			
			if (['RSASSA-PKCS1-v1_5', 'RSA-PSS', 'RSA-OAEP'].indexOf(algorithm) < 0) {
				throw new Error('Unexpected key gen algorithm ' + algorithm);
			}
			if (['SHA-256', 'SHA-384', 'SHA-512'].indexOf(hashAlgorithm) < 0) {
				throw new Error('Unexpected SHA ' + hashAlgorithm);
			}
			
			return btoa(btoa(JSON.stringify({
				name: algorithm,
				modulusLength: 2048,
				publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
				hash: hashAlgorithm
			})));
		}
		
		createEcKeyGenParams({ALG, EC}) {
			const algorithm = Cast.toString(ALG);
			const ellipticCurve = Cast.toString(EC);
			
			if (['ECDSA', 'ECDH'].indexOf(algorithm) < 0) {
				throw new Error('Unexpected key gen algorithm ' + algorithm);
			}
			if (['P-256', 'P-384', 'P-521'].indexOf(ellipticCurve) < 0) {
				throw new Error('Unexpected elliptic curve ' + hashAlgorithm);
			}
			
			return btoa(btoa(JSON.stringify({
				name: algorithm,
				namedCurve: ellipticCurve
			})));
		}
		
		createHmacKeyGenParams({HASH_ALG}) {
			const hashAlgorithm = Cast.toString(HASH_ALG);
			
			if (['SHA-256', 'SHA-384', 'SHA-512'].indexOf(hashAlgorithm) < 0) {
				throw new Error('Unexpected SHA ' + hashAlgorithm);
			}
			
			return btoa(btoa(JSON.stringify({
				name: 'HMAC',
				hash: hashAlgorithm
			})));
		}
		
		createAesKeyGenParams({ALG, LENGTH}) {
			const algorithm = Cast.toString(ALG);
			const length = Cast.toNumber(LENGTH);
			
			if (['AES-CTR', 'AES-CBC', 'AES-GCM', 'AES-KW'].indexOf(algorithm) < 0) {
				throw new Error('Unexpected key gen algorithm ' + algorithm);
			}
			if ([128, 192, 256].indexOf(length) < 0) {
				throw new Error('Unexpected key length ' + length);
			}
			
			return btoa(btoa(JSON.stringify({
				name: algorithm,
				length: length
			})));
		}
		
		async genKey({PARAMS}) {
			const strParams = Cast.toString(PARAMS);
			if (strParams === '') {
				throw new Error('Missing params');
			}
			let res = undefined;
			
			const params = JSON.parse(atob(atob(strParams)));
			crypto.subtle.generateKey(params, true, ['encrypt', 'decrypt'])
							   .then(result => res = btoa(btoa(JSON.stringify(result))));
			
			return res;
		}
		
		async encrypt({TEXT, KEY, ALG}) {
			
		}	

		async decrypt({TEXT, KEY, ALG}) {

		}
	}
	Scratch.extensions.register(new Extension());
	
})(Scratch);