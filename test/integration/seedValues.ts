const user = {
    id: 1,
    businessRegistrationNumber: '0123456789',
    phoneNumber: '01012345678',
};

const store = {
    id: 1,
    userId: 1,
    name: '소예다방',
    address: '고려대 근처',
    defaultOpeningHours: [
        {
            yoil: '일',
            start: null,
            end: null, //휴무일은 시작시간과 종료시간 모두 null 이어야함
        },
        {
            yoil: '월',
            start: '09:00',
            end: '18:00',
        },
    ]
};

const category = [
    {
        id: 1,
        storeId: 1,
        name: '커피',
        sort: 1,
    },
    {
        id: 2,
        storeId: 1,
        name: '티&에이드',
        sort: 2,
    },
];

const option = [
    {
        optionName: 'ice',
        optionPrice: 0,
        optionCategory: '온도',
        storeId: 1
    },
    {
        optionName: 'hot',
        optionPrice: 0,
        optionCategory: '온도',
        storeId: 1
    },
    {
        optionName: '케냐',
        optionPrice: 0,
        optionCategory: '원두',
        storeId: 1
    },
    {
        optionName: '콜롬비아',
        optionPrice: 300,
        optionCategory: '원두',
        storeId: 1
    },
    {
        optionName: '1샷 추가',
        optionPrice: 500,
        optionCategory: '샷',
        storeId: 1
    },
    {
        optionName: '연하게',
        optionPrice: 0,
        optionCategory: '샷',
        storeId: 1
    },
].map((option, index) => 
    ({
        ...option,
        id: index + 1,
    })
);

const menu = [
    {
        id: 1,
        categoryId: 1,
        name: '아메리카노',
        price: 2000,
        sort: 1,
    },
    {
        id: 2,
        categoryId: 1,
        name: '카페라떼',
        price: 3000,
        sort: 2,
    },
    {
        id: 3,
        categoryId: 2,
        name: '아이스티',
        price: 2500,
        sort: 3,
    }
]

export default {
    user,
    store,
    category,
    option,
    menu,
}
