import React,{useState, useEffect, useContext} from 'react';
import axios from "axios";
import { userContext } from '../App';
import { filterPaginationData } from '../common/filterPaginationData';
import Loader from '../components/Loader';
import AnimationWrapper from '../common/pageAnimation';
import NotificationCard from '../components/NotificationCard';
import NoData from '../components/NoData';
import LoadMoreDataButton from '../components/LoadMoreDataButton';


function Notifications() {
    const {userAuth, setUserAuth, userAuth: { access_token, new_notification_available }} = useContext(userContext);

    const [filter, setFilter] = useState("all");
    const [notifications, setNotifications] = useState(null);

    const filtersTab = ["all", "like", "comment", "reply"];

    const fetchNotifications = ({page, deleteDocCount=0})=>{
        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/notifications`, { page, filter, deleteDocCount}, {
            headers:{
                "Authorization": `Bearer ${access_token}`
            }
        })
        .then(async({ data: { notifications: data } })=>{

            if(new_notification_available){
                setUserAuth({...userAuth, new_notification_available: false})
            }

            let formatedData = await filterPaginationData({
                state:notifications,
                data, page,
                countRoute:"/all-notifications-count",
                data_to_send: { filter },
                user: access_token
            })

            setNotifications(formatedData);
        })
        .catch(error=>{
            console.log(error);
        })
    }

    const handleFilterTab =(e)=>{
        let btn = e.target;
        setFilter(btn.innerHTML);
        setNotifications(null);
    }

    useEffect(()=>{
        if(access_token){
           fetchNotifications({ page: 1 })
        }

    },[access_token, filter])

  return (
    <div>
        <h1 className="max-md:hidden">Recent Notifications</h1>
        <div className="my-8 flex gap-6">
            {
                filtersTab.map((filterTab, i)=>{
                    return <button 
                            className={`py-2 ${filter === filterTab ? "btn-dark": "btn-light"}`} 
                            key={i}
                            onClick={handleFilterTab}
                        >
                            {filterTab}
                        </button>
                })
            }
        </div>
        {
            notifications === null ? <Loader/> : 
            <>
                {
                    notifications.results.length ? 
                    notifications.results.map((notification, i)=>{
                        return <AnimationWrapper key={i} transition={{ delay: i * 0.8 }}>
                            <NotificationCard 
                                data={notification} 
                                index={i} 
                                notificationState={{ notifications, setNotifications}}
                            />
                        </AnimationWrapper>
                    })
                    : <NoData message="Nothing Available"/>
                }

                <LoadMoreDataButton 
                    state={notifications} 
                    fetchDataFun={fetchNotifications} 
                    additionalParams= {{ deletedDocCount: notifications.deleteDocCount}}
                />
            </>
        }
    </div>
  )
}

export default Notifications;
