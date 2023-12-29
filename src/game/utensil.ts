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
export const createBigInt = ([n, z]) => {
    let number = `${n}`
    for (let i = 0; i < z; i++) {
        number += '0'
    }
    return BigInt(number)
}


export const spdSequenceGenerator = (initialValue) => {
    let sequence = [initialValue];
    return function (level) {
        if (level <= sequence.length) {
            return sequence[level - 1];
        }
        for (let i = sequence.length + 1; i <= level; i++) {
            sequence.push(sequence[i - 2] * (1 - 0.01 * (i - 1)));
        }
        return sequence[level - 1];
    };
};

export const atkSequenceGenerator = (initialValue: bigint) => {
    let sequence = [initialValue]
    return function (level) {
        if (level <= sequence.length) {
            return sequence[level - 1];
        }
        for (let i = sequence.length + 1; i <= level; i++) {
            sequence.push(
                ((sequence[i - 3] || initialValue)
                    +
                    sequence[i - 2]) / 2n
                +
                BigInt(Math.ceil(Number(initialValue) * (i / 27)))
            );
        }
        // 暂时抑制攻击增长
        // const ex = 1n + BigInt(Math.floor(level / 50));
        return sequence[level - 1]
    }
}


export const random = (min: number = 0, max: number = 1): bigint => {
    return BigInt(Math.ceil(Math.random() * (max - min) + min));
};

/**
 *  
 * @param restrain 
 * @param promote 
 * @param min 
 * @param max 
 * @param norm 
 * @returns 
 */
export const randomWithAgl = (restrain: number, promote: number, min: number, max: number, norm: number): boolean => {
    const r = Math.random() * 100;
    const short = (promote - restrain) / 16;
    norm += short;
    norm = norm > max ? max : norm;
    norm = norm < min ? min : norm;
    return r < norm;
};
