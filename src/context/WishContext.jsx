import { createContext, useState, useEffect, useContext } from "react";
import { dbService } from "../routes/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { UserContext } from "./UserContext";
import { LoaderContext } from "./LoaderContext";

export const WishContext = createContext();

export function WishContextProvider({ children }) {
  const [wish, setWish] = useState({});
  const [wishList, setWishList] = useState([]);

  const { user } = useContext(UserContext);
  const { setLoading } = useContext(LoaderContext);

  const userId = user.uid;

  const current = new Date().getMonth() + 1;

  const fetchWish = async () => {
    setLoading(true);
    try {
      let tempData = {};
      let tempWishList = [];
      if (!userId) return;
      const q = query(
        collection(dbService, "wish"),
        where("uid", "==", userId)
      );
      onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tempWishList.push(data);
          const dataMonth = new Date(data.createdAt.toDate()).getMonth() + 1;
          if (dataMonth === current) {
            tempData = data;
          }
          setWish(tempData);
        });
        setWishList(tempWishList);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWish();
  }, [user]);

  return (
    <WishContext.Provider value={{ wish, wishList }}>
      {children}
    </WishContext.Provider>
  );
}
