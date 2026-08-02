import assume from './assume.js';

const ROMAN = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X',
};

/**
 *
 */
const romanize = (number) => {
    assume(ROMAN[number], 'Unexpected number to romanize!');
    return ROMAN[number];
};

export default romanize;
