//
//  HomeView.swift
//  qQuick
//
//  Created by Hani Atta on 18/10/24.
//

import SwiftUI

struct HomeView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack {
                    ScrollView {
                        CircleCard(title: "Buy sneakers", raisedAmount: 250, targetAmount: 1000)
                        CircleCard(title: "Buy sneakers", raisedAmount: 250, targetAmount: 1000)
                    }
                    Spacer()
                }
                .padding(.vertical)
                .toolbar{
                    ToolbarItem(placement: .cancellationAction) {
                        Text("qQuick")
                            .font(.title)
                    }
                    
                    ToolbarItem(placement: .confirmationAction) {
                        Image(systemName: "bell")
                            .foregroundColor(.white)
                    }
                }
                //            .navigationBarTitle("qQuick")
                //            .navigationBarItems(trailing: Button(action: {
                //                // Add notification action here
                //            }) {
                //                Image(systemName: "bell")
                //                    .foregroundColor(.white)
                //            })
                .padding(.horizontal)
            }
        }
        .background(Color.black)
    }
}

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}
