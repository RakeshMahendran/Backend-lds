const FlightBooking = require('../model/flight_booking')
const FlightPassengers=require('../model/flight_passenger')


exports.createPassengers=async(req,res,next)=>{
    const newBooking = new FlightBooking();
    pci=req.body.PassengerContactInfo;
    newBooking.user_id=req.userId;
    newBooking.passenger_contact_info.phone_number=pci.PhoneNumber;
    newBooking.passenger_contact_info.phone_country_code=pci.PhoneCountryCode;
    newBooking.passenger_contact_info.alternate_phone_number=pci.AlternatePhoneNumber;
    newBooking.passenger_contact_info.email=pci.Email;
    newBooking.target_api=req.body.IteneraryRefID;
    newBooking.currency=req.body.Currency;


    newBooking.booking_status="init";

    const paxTypeCount={
        ADT:0,
        CHD:0,
        INT:0
    }

    for(p of req.body.PassengerDetails){
        paxTypeCount[p.PassengerTypeCode]++;
        const newpassenger= await createNewPassenger(p);
        newBooking.flight_passenger_id.push(newpassenger._id);
    }

    const nb=await newBooking.save()
    req.bookingId=nb._id;
    req.paxTypeCount=paxTypeCount
    next()

}


async function createNewPassenger(e){
    console.log('[+]Creating New passenger...')
    const newpassenger=new FlightPassengers();
    newpassenger.gender=e.Gender
    newpassenger.passenger_type=e.PassengerTypeCode
    newpassenger.prefix=e.Title
    newpassenger.firstName=e.FirstName
    newpassenger.lastName=e.LastName
    newpassenger.dateOfBirth=e.DOB
    newpassenger.nationality=e.Nationality
    newpassenger.passport_no=e.PassportNumber
    newpassenger.passport_expiry_date=e.PassportExpiryDate
    newpassenger.passport_issuance_country=e.PassengerIssueCountry
    newpassenger.seat_preferrence=e.Seat
    newpassenger.frequent_flyer_number=e.FrequentFlyerNumber
    newpassenger.meal_request=e.MealCode
    newpassenger.is_wheel_chair=e.IsWheelchair
    return await newpassenger.save();
}
