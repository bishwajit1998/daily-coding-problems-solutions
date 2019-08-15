/*Given a list of numbers and a number k, return whether any two numbers from the list add up to k.

For example, given [10, 15, 3, 7] and k of 17, return true since 10 + 7 is 17.

Bonus: Can you do this in one pass?*/
import java.util.Scanner;
import java.io.*;
class dcp1
{
  static int k;
  public static void main(String[] args) {
    Scanner sc=new Scanner(System.in);
    System.out.println("enter value of n");
    int n = sc.nextInt();
    int a[]=new int[n];
    System.out.println("enter values ");
    for (int i=0;i<n ;i++ ) {
      a[i]=sc.nextInt();

    }
    System.out.println("enter k");
    k=sc.nextInt();
    for (int i=0;i<n ;i++ ) {
      for (int j=i+1;j<n ;j++ ) {
        if(a[i]+a[j]==k){
        System.out.println(a[i]);
        System.out.println(a[j]);
      }

      }
    }
  }
}
