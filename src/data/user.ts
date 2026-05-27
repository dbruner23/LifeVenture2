export interface CurrentUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  location: string;
}

export const currentUser: CurrentUser = {
  id: 'me',
  name: 'David Bruner',
  handle: '@davidb',
  avatar: 'https://i.pravatar.cc/200?img=15',
  location: 'Wellington, NZ',
};
