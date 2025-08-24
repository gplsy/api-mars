export const CONFIG = {
    gojek: {
        restaurants: "https://api.gojekapi.com/gofood/consumer/v3/restaurants",
        search: "https://api.gojekapi.com/gofood/consumer/v3/search",
        drivers: "https://api.gojekapi.com/gojek/service_type/1/drivers/nearby",
        pickup: "https://api.gojekapi.com/v1/pickup-spots",
        spots: "https://api.gojekapi.com/v1/location/search",
    },
    grab: {
        restaurants: "https://p.grabtaxi.com/api/passenger/v3/grabfood/nearby",
        search: "https://p.grabtaxi.com/api/passenger/v3/grabfood/search",
        drivers: "",
        pickup: "https://",
    },
    shopee: {
        foody: "https://foody.shopee.co.id/api/buyer/listing-detail",
        search: "https://foody.shopee.co.id/api/buyer/stores/-/action/search",
        cookie: process.env.SHOPEE_COOKIE,
    },
};
