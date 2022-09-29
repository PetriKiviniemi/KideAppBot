import { useEffect, useState, useRef } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './Authentication.js'
import Timer from './Timer.js'
import './Home.css'

const Home = () => {

    const eventIDField = useRef()
    const checkMarkRef = useRef()
    const checkMarkAlternativeRef = useRef()

    const { onLogout } = useAuth();
    const [ eventFound, setEventFound ] = useState(false)
    const [ eventId, setEventId ] = useState("")
    const [ selectedVariants, setSelectedVariantsState ] = useState([])
    const [ eventImgUrl, setEventImgUrl] = useState("")

    const [ eventVariants, setEventVariants ] = useState([])
    const [ eventID, setEventID ] = useState("")
    const [ ticketPurchaseInfo, setTicketPurchaseInfo ] = useState("Liput lisätty ostoskoriin!")
    const [ timerData, setTimerData ] = useState(["0", "0"])
    const [ ticketAvailability, setTicketAvailability ] = useState(0)
    const [ succesfullyAddedTickets, setSuccessfullyAddedTickets ] = useState([])

    useEffect(() => {
        if(succesfullyAddedTickets.length > 0)
        {
            let newStr = "Liput "
            for(let i = 0; i < succesfullyAddedTickets.length; i++)
            {
                newStr += '"' + succesfullyAddedTickets[i] + '"'
                if(i+1 != succesfullyAddedTickets.length)
                    newStr += ","
            }
            newStr += " lisätty ostoskoriin!"
            setTicketPurchaseInfo(newStr)
            checkMarkRef.current.className = "checkmark-wrapper"
            checkMarkAlternativeRef.current.className = "hidden"
        }
        else
        {
            setTicketPurchaseInfo("Lippuja ei ollut enää saatavilla!")
            if(checkMarkAlternativeRef.current)
            {
                checkMarkRef.current.className = "hidden"
                checkMarkAlternativeRef.current.className = "ticket-purchase-info"
            }
        }
    }, [succesfullyAddedTickets]);

    const handleLogout = () => {
        onLogout()
    }

    const findEvent = (e) => {
        e.preventDefault()
        setEventFound(eventIDField.current.value)
        setEventId(eventIDField.current.value)
        fetch('https://api.kide.app/api/products/' + eventIDField.current.value)
           .then(res => res.json())
           .then((result) => {
                setEventImgUrl(
                    'https://portalvhdsp62n0yt356llm.blob.core.windows.net/bailataan-mediaitems/' + result.model.product.mediaFilename
                )
                setEventVariants(result.model.variants)
            })
    }

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
    
    const tryToAddToCart = async (e) => {

        if(selectedVariants.length <= 0)
            return


        const postBody = {
            "toCreate" :[
                {
                    "inventoryId": "null",
                    "quantity":1,
                    "productVariantUserForm":null
                }
            ],
            "toCancel":[]
        }
        const postRequestData = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
                'authorization': localStorage.getItem('bearerToken'),
            },
            body: JSON.stringify(postBody)
        }

        fetch('https://api.kide.app/api/products/' + eventId)
            .then(res => res.json())
            .then((result) => {
                if(result.model.product.timeUntilSalesStart > 0)
                {
                    checkMarkRef.current.className = "hidden"
                    checkMarkAlternativeRef.current.className = "ticket-purchase-info"
                    setTicketPurchaseInfo("Yritetään noutaa lippuja ASAP...")
                    let minutes = (result.model.product.timeUntilSalesStart/1000)/60
                    let seconds = (result.model.product.timeUntilSalesStart/1000)%60
                    setTimerData([minutes, seconds])
                    sleep(result.model.product.timeUntilSalesStart)
                }


                //We could check for availability after timer until it's > 0
                //But it's uncertain how fast the API updates itself
                //Therefore it's safer to bloat the API a little and poll the website
                //until tickets are available
                var fetchCount = 0
                var ticketsAvailable = 0

                const fetchTicketsAvailability = async () => {
                    const res = await fetch('https://api.kide.app/api/products/' + eventId)
                    const json = res.json()

                    if(fetchCount > 15)
                        return 0

                    if(!("error" in result) && ticketsAvailable == 0)
                    {
                        ticketsAvailable = result.model.product.availability
                        return ticketsAvailable
                    }
                    else
                    {
                        sleep(150)
                        fetchCount += 1
                        fetchTicketsAvailability();
                    }
                }

                setSuccessfullyAddedTickets([])
                fetchTicketsAvailability().then(ticketsAvailable => {
                    if(ticketsAvailable> 0)
                    {
                        for(let i = 0; i < selectedVariants.length; i++)
                        {
                            var newPostBody = JSON.parse(JSON.stringify(postBody))
                            newPostBody.toCreate[0].inventoryId = selectedVariants[i].inventoryId

                            var newPostRequestData = JSON.parse(JSON.stringify(postRequestData))
                            newPostRequestData.body = JSON.stringify(newPostBody)

                            fetch('https://api.kide.app/api/reservations', newPostRequestData)
                                .then(res => res.json())
                                .then((result) => {
                                    if(!("error" in result))
                                    {
                                        if(!succesfullyAddedTickets.find(elem => elem.inventoryId == result.model.reservations[0].inventoryId))
                                        {
                                            setSuccessfullyAddedTickets(
                                                curTickets => [
                                                    ...curTickets, 
                                                    selectedVariants.find(
                                                        elem => elem.inventoryId == result.model.reservations[0].inventoryId
                                                    ).name
                                                ]
                                            )
                                        }
                                    }
                                })
                        }
                    }
                })})
        }

    const selectVariantDiv = (divTarget, item) => {
        divTarget.target.classList.toggle('transition');
        if(divTarget.target.className == "event-variant-option transition")
        {
            let temp = selectedVariants
            temp.push(item)
            setSelectedVariantsState(temp)
        }
        else
        {
            removeVariantFromList(item)
        }
        console.log(selectedVariants)
    }

    const removeVariantFromList = (item) => {
        let temp = selectedVariants
        for(let i = 0; i < selectedVariants.length; i++)
        {
            if(selectedVariants[i].inventoryId === item.inventoryId)
            {
                temp.splice(i, 1)
            }
        }
        setSelectedVariantsState(temp)
    }

    const checkIfVariantInList = (item) => {
        for(let i = 0; i < selectedVariants.length; i++)
        {
            if(selectedVariants[i].inventoryId === item.inventoryId)
                return true
        }
        return false
    }

    const getEventData = () => {
        return (
          <div className="event-data-container">
            <div className="event-image-container">
                <img src={eventImgUrl} alt="Event Image" className="event-image"/>
            </div>

            <div className="event-variations-menu">
            <h2 style={{color: 'rgb(100, 100, 100)'}}>Valitse haluamasi liput</h2>
              {eventVariants.map(item => (
                  <li className="event-variant-option" onClick={(e) => selectVariantDiv(e, item)}>{item.name}  {item.pricePerItem / 100 + "€"}</li>
              ))}
            </div>

            <div className="event-submit-container">
              <button className="event-id-submit" onClick={tryToAddToCart}>Käynnistä</button>
            <div ref={checkMarkRef} className="hidden"> 
            <h2 style={{color: 'rgb(100, 100, 100)'}}>{ticketPurchaseInfo}</h2>
            <svg
                className="checkmark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            </div>
            <div ref={checkMarkAlternativeRef} className='hidden'>
            <h2 style={{color: 'rgb(100, 100, 100)'}}>{ticketPurchaseInfo}</h2>
            </div>
            <div className="timer-container">
              <h3 style={{color: 'rgb(100, 100, 100)'}}>Aikaa lippujen julkaisuun:</h3>
              <Timer initialMinute={timerData[0]} initialSeconds={timerData[1]}/>
            </div>
            </div>
          </div>
        )
    }

    let currentEventData;
    if(eventFound) {
        currentEventData = getEventData()
    }

    return(
        <div className="Home">
          <div className="nav-bar">
              <h2>KideApp bot</h2>
              <button className="logout-button" onClick={handleLogout}>
                  Logout
              </button>
          </div>

          <div className="event-id-form">
            <h2 style={{color: 'rgb(100, 100, 100)'}}>Tapahtuman ID</h2>
            <form>
              <input className="event-id-field" type="text" name="event-id" ref={eventIDField}/>
              <button className="event-id-submit" onClick={findEvent}>Etsi tapahtuma</button>
            </form>
          </div>

          {currentEventData}

        </div>
    )
}

export default Home;
