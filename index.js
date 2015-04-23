var Transformer = require('babel-core').Transformer;

var classes = {};

function generateMockFile(className, methods) {
	var output = '/*global jest*/\n\n';
	output += 'const ' + className + ' = {};\n';
	output += methods.map(function(method) {
		return className + '.' + method + ' = jest.genMockFunction();'
	}).join('\n');
	output += '\nexport default ' + className + ';\n'
	return output;
}

module.exports = new Transformer('jest-alt', {
	ClassDeclaration: function(node) {
		var className = node.id.name;
		classes[className] = [];
		var methods = node.body.body;
		methods.forEach(function(method) {
			var name = method.key.name;
			if (name !== 'constructor') {
				classes[className].push(name);
			} else {
				var statements = method.value.body.body;
				statements.forEach(function(statement) {
					if (statement.expression.type !== 'CallExpression') {
						return;
					}

					var callee = statement.expression.callee;
					if (callee.type === 'MemberExpression' &&
						callee.object.type === 'ThisExpression' &&
						callee.property.name === 'generateActions') {
						statement.expression['arguments'].forEach(function(argument) {
							classes[className].push(argument.value);
						});
					}
				});
			}
		});
	},
	ExportDefaultDeclaration: function(node) {
		if (node.declaration.type !== 'CallExpression') {
			return;
		}
		var callExpression = node.declaration.callee;
		if (callExpression.property.name != 'createActions') {
			return;
		}
		var arg = node.declaration.arguments[0];
		if (!arg) {
			return;
		}
		console.log(generateMockFile(arg.name, classes[arg.name]));
	}
});
