import Unsplash from 'unsplash-js';

export default {
	data() {
		return {
			unsplash: null
		}
	},

	created: function () {
		this.unsplash = new Unsplash({
			applicationId: '13f754bdafa2df3257c35acdcfcf022f071aff0a69c81f6099eab5c8c9e4b4e9',
			secret: '82d7c21a906db1507537c679d5a62ec6d63854ecdf20cf049de234f2b986fce1',
			callbackUrl: 'urn:ietf:wg:oauth:2.0:oob'
		});
	}
}
