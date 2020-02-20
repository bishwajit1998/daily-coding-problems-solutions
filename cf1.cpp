#include<bits/stdc++.h>
using namespace std;

int main()
{
	int ar[4];

	for(int i=0;i<4;i++)
	{
		cin>>ar[i];
	}
	int n=sizeof(ar)/sizeof(ar[0]);
  sort(ar,ar+n);
  
  
int x4=ar[3];
int x1=ar[0];
int x2=ar[1];
int x3=ar[2];

int a = abs(x1-x4);
int b = abs(x2-x4);
int c = abs(x3-x4);


cout<<a<<" "<<b<<" "<<c<<" ";
	return 0;
}