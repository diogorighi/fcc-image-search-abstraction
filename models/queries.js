var mongoose = require('mongoose');

var querySchema = new mongoose.Schema({
	term: String,
	when: {
		type: Date,
		default: Date.now
	}
});

mongoose.model("Query", querySchema);
