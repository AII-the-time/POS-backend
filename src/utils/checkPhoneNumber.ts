export default (input: string): boolean => {
    const regex = /^01[016789][1-9]\d{6,7}$/;
    return regex.test(input);
}
