export default function (option: string) {
    const text = option

    return {
        copy() {
            return navigator.clipboard.writeText(text)
        }
    }
}
