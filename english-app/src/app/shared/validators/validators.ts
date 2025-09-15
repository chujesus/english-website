export function onlyNumbers(charCode: number): boolean {
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    } else {
        return true;
    }
}

export function titleCaseTranform(value: string, words: boolean = true) {
    value = value.toLowerCase();
    let valuesArray = value.split(" ");
    if (value.trim() !== "") {
        if (words) {
            for (let i in valuesArray) {
                valuesArray[i] = valuesArray[i][0].toUpperCase() + valuesArray[i].substring(1);
            }
        } else {
            valuesArray[0] = valuesArray[0][0].toUpperCase() + valuesArray[0].substring(1);
        }
        return valuesArray.join(" ");
    }

    return "";
}