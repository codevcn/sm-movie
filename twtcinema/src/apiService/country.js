import instance from './instance';

export const getAllCountries = async () => {
    return instance.get('/country/get-all-countries');
};
