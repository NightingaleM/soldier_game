export const JSON_with_bigInt = (data) => {
    return JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    );
};



export const createProbabilityFunction = ({
    probability: {
        default: defaultProbability, max: maxProbability, min: minProbability
    },
    reference: {
        default: defaultReference, max: maxReference, min: minReference
    },
}) => {
    // 计算斜率和截距
    const slope = (maxProbability - minProbability) / (maxReference - minReference);
    const intercept = defaultProbability - slope * defaultReference;

    return (value) => {
        if (value <= minReference) {
            return minProbability;
        } else if (value >= maxReference) {
            return maxProbability;
        } else {
            // 线性插值
            return slope * value + intercept;
        }
    }
}
