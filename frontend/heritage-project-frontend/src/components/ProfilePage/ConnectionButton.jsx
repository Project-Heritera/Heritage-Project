import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ConnectionButton({ pageUser, viewUser }) {
  //Add functionality to button based on weather or not they are friended, pending, or not friended

  //Get the pageUsers friends and see if the viewUser is one of them
  const [connections, setConnections] = useState(null);
  const [requests, setRequests] = useState(null);
  const [sentRequests, setSentRequests] = useState(null);

  useEffect(() => {
    const fetchConnections = async () => {
      //Get friends of viewUser
      try {
        console.log("Retireving friends for button of user:", viewUser)
        const response = await api.get(`/accounts/friends/${viewUser}/`);
        console.log("API connections button response:", response)
        if (response.status === 204 || !response.data) {
          setConnections([]);
        } else {
          setConnections(response.data.friends || []);
        }
      } catch (error) {
        console.error("Error geting connections for button:", error)
      }

      //Get friend requests of viewuser
      try {
        const response = await api.get(`/accounts/friend/requests/`);
        console.log("API connections request button response:", response)
        if (response.status === 204 || !response.data) {
          setRequests([]);
        } else {
          setRequests(response.data.requests || []);
        }
      } catch (error) {
        console.error("Error geting requests for button:", error)
      }

      //Get a list of the logged in users sent friend requests
      try {
        const response = await api.get(`/accounts/friend/requests/sent/`);
        console.log("API connections pending request button response:", response)
        if (response.status === 204 || !response.data) {
          setSentRequests([]);
        } else {
          setSentRequests(response.data.pending_users || []);
        }
      } catch (error) {
        console.error("Error geting requests for  pending button:", error)
      }

    };

    fetchConnections();
  }, []);

  if (!connections || !requests || !sentRequests) {
    return (<Button>Loading...</Button>)
  }

  console.log("Searching for friended user: ", pageUser)
  const requestObject = requests.find((req) => req.from_user.username === pageUser)
  const pendingObject = sentRequests.find((req) => req.User.username === pageUser)

  const isFriend = connections && connections.some((friend) => friend.username === pageUser);
  const isRequest = !!requestObject
  const isPending = !!pendingObject

  console.log("ALL APIS LOADED");

  const acceptConnection = async () => {
    console.log("Accepting FR")
    const reqId = requestObject.id
    try {
      const response = await api.post(`/accounts/friend/accept/${reqId}/`);
      console.log("Accepted FRIEND REQUEST")
    } catch (error) {
      console.error("Error accepting friend request: ", error)
    }
  }

  const denyConnection = async () => {
    console.log("Denying FR")
    const reqId = requestObject.id
    try {
      const response = await api.post(`/accounts/friend/reject/${reqId}/`);
      console.log("Denyed FRIEND REQUEST")
    } catch (error) {
      console.error("Error denying friend request: ", error)
    }
  }

  const removeConnection = async () => {
    console.log("Removing connection")

    try {
      const response = await api.post(`/accounts/friend/remove/${pageUser}/`);
      console.log("REMOVED FRIEND")
    } catch (error) {
      console.error("Error removing friend: ", error)
    }
  }

  const addConnection = async () => {
    try {
      const response = await api.post(`/accounts/friend/add/${pageUser}/`);
      console.log("SENT FRIEND REQUEST")
    } catch (error) {
      console.error("Error sending friend request: ", error)
    }
  }

  const cancelConnection =  async () => {
    console.log("Canceling FR")
    const reqId = pendingObject.friendship_request_id
    try {
      const response = await api.post(`/accounts/friend/cancel/${reqId}/`);
      console.log("Canceld FRIEND REQUEST")
    } catch (error) {
      console.error("Error canceling friend request: ", error)
    }
  }

  if (isFriend) {
    return (
      <Button onClick={removeConnection}>
        Remove Connection
      </Button>
    )
  } else if (isPending) {
    return (
      <Button onClick={cancelConnection}>
        Cancel Request
      </Button>
    )
  } else if (isRequest) {
    //User has sent you a request. Accept it with button or use three dot menu to reject it
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default">
            Incoming Request
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={acceptConnection}>
            Accept
          </DropdownMenuItem>
          <DropdownMenuItem onClick={denyConnection}>
            Deny
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else {
    return (
      <Button onClick={addConnection}>
        Add Connection
      </Button>
    )
  }
}

export default ConnectionButton;