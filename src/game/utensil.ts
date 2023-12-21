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


export const CheckActiveEffect = function (effectName) {
    return function (target, name, descriptor) {
        console.log('this', this)
        console.log(target, name, descriptor)
        const originalMethod = descriptor.value;
        descriptor.value = function () {
            console.log(`Calling "${name}" with`, arguments);
            return originalMethod.apply(this, arguments);
        };
        return descriptor;
    }
}

/**
 * 生成大数
 * @param n 第一位数
 * @param z 后面跟 z 个 0
 */
export const createBigInt = ([n,z])=>{
    let number = `${n}`
    for(let i=0;i<z;i++){
        number += '0'
    }
    return BigInt(number)
}
