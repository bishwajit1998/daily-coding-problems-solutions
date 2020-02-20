#include<iostream>
using namespace std;
#define ISEQUAL(X,Y) X==Y
int main()
{
   int x,y,z;
   x=y=z=4;

   z=ISEQUAL(x,y);
   cout<<x<<" "<<y<<""<<z;

   ISEQUAL(z,(x==y));
   cout<<x<<" "<<y<<""<<z;
   return 0;

}