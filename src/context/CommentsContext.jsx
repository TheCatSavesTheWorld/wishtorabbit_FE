import { createContext, useState, useEffect, useContext } from "react";
import { dbService } from "../routes/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { UserContext } from "./UserContext";
import { LoaderContext } from "./LoaderContext";
import { WishContext } from "./WishContext";

export const CommentsContext = createContext();

export function CommentsContextProvider({ children }) {
  const [commentList, setCommentsList] = useState([]); //반환할 값
  const [tmp, setTmpList] = useState([]);
  const [commentsByOtherUser, setCommentsByOtherUser] = useState([]); //다른사람에게 받은 코멘트

  const { user } = useContext(UserContext);
  const { setLoading } = useContext(LoaderContext);
  const { wish, wishList } = useContext(WishContext); //소원 목록

  const userId = user.uid;

  //wishList 갱신됐을 때 실행
  const makeCommentSpace = () => {
    for (let i = 0; i < wishList.length; i++) {
      let wishContent = wishList[i].content;
      let wishMonth = new Date(wishList[i].createdAt.toMillis()).getMonth();
      setTmpList((tmp) => [
        { month: wishMonth, content: wishContent, comments: [] },
        ...tmp,
      ]);
    }
  };

  //tmp 갱신됐을 때 실행
  const getCommentsFromFirebase = async () => {
    const findCommentsQuery = query(
      collection(dbService, "comment"),
      where("uid", "==", userId)
    );
    const findComments = await getDocs(findCommentsQuery);
    setCommentsByOtherUser(findComments.docs);
  };

  //commentsByOtherUser 갱신 시 실행
  const pushComments = () => {
    //setCommentsList(tmp);
    for (let i = 0; i < commentsByOtherUser.length; i++) {
      let cm = new Date(
        commentsByOtherUser[i].data().createdAt.toMillis()
      ).getMonth();
      for (let j = 0; j < tmp.length; j++) {
        let wm = tmp[j].month;
        if (cm == wm) {
          tmp[j].comments.push({
            key: commentsByOtherUser[i].data().cid,
            sender: commentsByOtherUser[i].data().sender.sender,
            content: commentsByOtherUser[i].data().content.content,
            selectedType: commentsByOtherUser[i].data().type.selectTypes,
            createdAt: new Date(
              commentsByOtherUser[i].data().createdAt.toMillis()
            ).toString(),
          });
        }
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    if (wishList.length === 0) setLoading(false);
    makeCommentSpace();
  }, [wishList]);

  useEffect(() => {
    getCommentsFromFirebase();
  }, [tmp]);

  useEffect(() => {
    pushComments();
    setCommentsList(tmp);
    setLoading(false);
  }, [commentsByOtherUser]);

  return (
    <CommentsContext.Provider value={{ commentList }}>
      {children}
    </CommentsContext.Provider>
  );
}
