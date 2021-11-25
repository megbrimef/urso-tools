import chalk from 'chalk';
import sym from 'log-symbols';

const MessageTypes = {
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
};

function greet(message) {
    const msg = ` ${message.toUpperCase()} `;
    console.log(chalk.blue.inverse(msg));
}

function getPrefix(type, label) {
    const lbl = ` ${label ? label.toString().toUpperCase() : type} `;
    switch (type) {
    case MessageTypes.SUCCESS:
        return `${sym.success} ${chalk.green.inverse.bold(lbl)}`;

    case MessageTypes.WARNING:
        return `${sym.warning} ${chalk.yellow.inverse.bold(lbl)}`;

    case MessageTypes.ERROR:
        return `${sym.error} ${chalk.red.inverse.bold(lbl)}`;

    default:
        return `${sym.info} ${chalk.blue.inverse.bold(lbl)}`;
    }
}

function printToConsole(type, label, message) {
    const prefix = getPrefix(type, label);
    console.log(`${prefix} ${message.trim()}`);
}

function logError(message, label) {
    printToConsole(MessageTypes.ERROR, label, chalk.red(message));
}

function logInfo(message, label) {
    printToConsole(MessageTypes.INFO, label, chalk.blue(message));
}

function logSuccess(message, label) {
    printToConsole(MessageTypes.SUCCESS, label, chalk.green(message));
}

function logWarning(message, label) {
    printToConsole(MessageTypes.WARNING, label, chalk.yellow(message));
}

function getProgressText(msg) {
    return chalk.yellow(msg);
}

export {
    greet,
    logInfo,
    logError,
    logSuccess,
    logWarning,
    getProgressText,
};
