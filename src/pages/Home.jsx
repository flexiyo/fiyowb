import React from "react";
import { useNavigate } from "react-router-dom";
import Post from "../components/home/Post.jsx";
import FeedCard from "../components/home/FeedCard.jsx";
import CustomTopNav from "../layout/items/CustomTopNav.jsx";
import { ChatIcon, CreateIcon, NotificationsIcon } from "../icons.jsx";

const Home = () => {
  const navigate = useNavigate();
  const feedItems = [
    { id: 1, heading: "New Features", text: "Check out our latest updates!" },
    { id: 2, heading: "Community Update", text: "Join our growing community" },
    { id: 3, heading: "Tips & Tricks", text: "Learn new ways to use our app" },
  ];

  const posts = [
    {
      id: "1",
      profilePic: "https://i.pravatar.cc/200?img=1",
      username: "john.doe",
      songInfo: { name: "Echoes", artist: "Fleetwood Band" },
      postImage:
        "https://demo.tiny.pictures/main/example5.jpg?width=500&height=250",
      likesCount: 215,
      commentsCount: 98,
      sharesCount: 45,
      caption: "A beautiful day to vibe with this amazing track!",
      uploadDate: "12 January 2025",
    },
    {
      id: "2",
      profilePic: "https://i.pravatar.cc/200?img=2",
      username: "jane.smith",
      songInfo: { name: "Golden Hour", artist: "JVKE" },
      postImage:
        "https://demo.tiny.pictures/main/example1.jpg?width=500&height=250",
      likesCount: 332,
      commentsCount: 120,
      sharesCount: 67,
      caption: "Can't stop listening to this masterpiece 🌅",
      uploadDate: "11 January 2025",
    },
    {
      id: "3",
      profilePic: "https://i.pravatar.cc/200?img=3",
      username: "mike.breeze",
      songInfo: { name: "Ocean Eyes", artist: "Billie Eilish" },
      postImage:
        "https://demo.tiny.pictures/main/example3.jpg?width=500&height=250",
      likesCount: 450,
      commentsCount: 210,
      sharesCount: 80,
      caption: "Lost in the magic of this song 🎧.",
      uploadDate: "30 December 2024",
    },
    {
      id: "4",
      profilePic: "https://i.pravatar.cc/200?img=4",
      username: "sarah.connor",
      songInfo: { name: "Blinding Lights", artist: "The Weeknd" },
      postImage:
        "https://demo.tiny.pictures/main/example4.jpg?width=500&height=250",
      likesCount: 789,
      commentsCount: 300,
      sharesCount: 120,
      caption: "This song always hits differently ✨.",
      uploadDate: "15 December 2024",
    },
  ];

  return (
    <div className="flex justify-center mx-auto w-full min-h-screen">
      <div className="flex flex-col lg:flex-row max-w-7xl w-full gap-6">
        {/* Main Content */}
        <div className="flex-1 lg:min-w-2/3 w-full">
          <CustomTopNav
            className="block md:hidden"
            logoImage="https://cdnfiyo.github.io/img/logos/flexiyo.png"
            rightIcons={[
              {
                resource: <CreateIcon size={32} />,
                onClick: () => navigate("/create"),
              },
              {
                resource: <NotificationsIcon size={32} />,
                onClick: () => navigate("/notifications"),
              },
              {
                resource: <ChatIcon size={32} />,
                onClick: () => navigate("/direct/inbox"),
              },
            ]}
          />
          <div className="flex flex-col w-full max-w-3xl mx-auto py-6">
            {/* Feed Section */}
            {/* <div className="flex overflow-x-auto no-scrollbar gap-4 my-6">
                {feedItems.map((item) => (
                  <FeedCard
                    key={item.id}
                    heading={item.heading}
                    text={item.text}
                  />
                ))}
              </div> */}

            {/* Posts Section */}
            <div className="flex flex-col items-center w-full gap-6">
              {posts.map((post, index) => (
                <Post
                  key={index}
                  profilePic={post.profilePic}
                  username={post.username}
                  songInfo={post.songInfo}
                  postImage={post.postImage}
                  likesCount={post.likesCount}
                  commentsCount={post.commentsCount}
                  sharesCount={post.sharesCount}
                  caption={post.caption}
                  uploadDate={post.uploadDate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
