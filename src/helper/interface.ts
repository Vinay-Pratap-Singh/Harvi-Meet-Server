// interface for each emoji data
export interface IEmojiData {
  emoji: string;
  id: string;
}

// for joined user data
interface IUserData {
  peerID: string;
  name: string;
  isMeetingOrganiser: boolean;
}

interface IRoomData {
  [peerID: string]: IUserData;
}

export interface IJoinedUsersData {
  [roomID: string]: IRoomData;
}
