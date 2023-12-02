import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
  EmailIcon,
  EmailShareButton,
} from "react-share";
import { authService } from "../routes/firebase";
import { LoaderContext } from "../context/LoaderContext";
import Loader from "../loader/Loader";
import "../style/reset.css";
import styles from "../style/home.module.css";
import { WishContext } from "../context/WishContext";
import { CommentsContext } from "../context/CommentsContext";

const Home = () => {
  const navigation = useNavigate();

  const { user, setUser } = useContext(UserContext); //user정보 전역 저장

  const { isLoading } = useContext(LoaderContext);

  const { wish, wishList } = useContext(WishContext);

  const { commentList } = useContext(CommentsContext);
  const [clickedMonth, setClickedMonth] = useState(-1); //클릭된 달
  const [clickedComments, setClickedComments] = useState([]); //클릭된 달의 코멘트 목록
  const [clickedWish, setClickedWish] = useState(""); //클릭된 달의 소원
  const [openList, setOpenList] = useState(false); //코멘트 목록 접고 열기

  //몇월의 떡을 클릭했는지
  const monthBtnClicked = (event) => {
    const preMonth = clickedMonth;
    setClickedMonth((prev) => event.target.value);
    if (clickedMonth !== -1 && preMonth === clickedMonth)
      setOpenList((prev) => !prev);
  };

  //클릭한 월의 comment 배열은 무엇인지
  useEffect(() => {
    for (let i = 0; i < commentList.length; i++) {
      if (commentList[i].month == clickedMonth) {
        setClickedComments(commentList[i].comments);
      }
    }
    setOpenList(true);
  }, [clickedMonth]);

  //선택한 월의 소원
  useEffect(() => {
    for (let i = 0; i < commentList.length; i++) {
      if (commentList[i].month == clickedMonth) {
        setClickedWish(commentList[i].content);
      }
    }
  }, [clickedComments]);

  const flag = Object.keys(wish).length == 0;

  const logOut = () => {
    authService
      .signOut()
      .then(function () {
        setUser(null);
        navigation("/");
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      if (!user) {
        navigation("/");
      }
    });
  }, []);

  useEffect(() => {}, [user]);

  const navigateToMakeWish = () => {
    navigation("/makewish");
  };

  //현재 화면 URL
  let currentUrl = window.location.href;
  //공유할 URL
  let shareUrl = currentUrl + `/${user.uid}`;

  if (isLoading)
    return <Loader type="spin" color="RGB 값" message={"로딩중입니다."} />;
  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.title}>{`${user.name}님의 달`}</h1>
        {wish !== {} && wish.content ? (
          <div className={styles.wish}>{wish.content}</div>
        ) : null}
      </div>
      <div>
        {flag ? (
          <button onClick={navigateToMakeWish}>나만의 소원 달 만들기</button>
        ) : null}
      </div>
      <h3 className={styles.text}>공유하기</h3>
      <div className={styles.shareBtn}>
        <FacebookShareButton url={shareUrl}>
          <FacebookIcon size={48} round={true} borderRadius={24}></FacebookIcon>
        </FacebookShareButton>
        <TwitterShareButton url={shareUrl}>
          <TwitterIcon size={48} round={true} borderRadius={24}></TwitterIcon>
        </TwitterShareButton>
        <EmailShareButton url={shareUrl}>
          <EmailIcon size={48} round={true} borderRadius={24}></EmailIcon>
        </EmailShareButton>
        <CopyToClipboard
          text={shareUrl}
          onCopy={(event) =>
            alert(`주소가 복사되었습니다.\n복사된 주소: ${event}`)
          }
        >
          <button>URL</button>
        </CopyToClipboard>
      </div>
      <img className={styles.moon} src="/images/moon.png" alt="달 사진" />
      <button onClick={logOut}>로그아웃</button>
      <div className={styles.wishList}>소원 리스트</div>
      <ul>
        {wishList.map((item, index) => (
          <li className={styles.wishList} key={index}>
            {item.content}
          </li>
        ))}
      </ul>
      <hr />
      <div className={styles.wishList}>떡 상자</div>
      <div>
        {commentList.map((item) => {
          if (item.comments.length != 0) {
            return (
              <button
                key={item.month}
                value={item.month}
                onClick={monthBtnClicked}
              >
                {item.month + 1}월의 떡
              </button>
            );
          }
        })}
      </div>
      {openList === false ? null : (
        <div>
          {clickedMonth === -1 ? null : (
            <div className={styles.wishList}>
              {Number(clickedMonth) + 1}월의 소원: {clickedWish}
            </div>
          )}
          <div>
            {clickedComments.map((item) => {
              return (
                <div key={item.key}>
                  <div className={styles.wishList}>
                    {item.sender}: {item.content}({item.selectedType})
                  </div>
                  <div className={styles.wishList}>{item.createdAt}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <hr />
    </div>
  );
};

export default Home;
