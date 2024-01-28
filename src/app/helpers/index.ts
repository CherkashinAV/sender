export function substituteOptions(text: string, options?: Record<string, string>) {
    let resultString = text;
    if (!options) {
        return resultString;
    }
    
    for (const [key, value] of Object.entries(options)) {
        const regex = new RegExp(`/{{${key}}}/gm`)
        resultString = resultString.replace(regex, value);
    }

    return resultString;
}

export function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
