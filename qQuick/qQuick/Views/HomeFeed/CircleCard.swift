//
//  CircleCard.swift
//  qQuick
//
//  Created by Hani Atta on 18/10/24.
//

import SwiftUI

struct CircleCard: View {
    var title: String
    var raisedAmount: Double
    var targetAmount: Double
    
    var progress: Double {
        raisedAmount / targetAmount
    }
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .font(.headline)
                .padding(.bottom, 5)
            
            HStack {
                Text("Raise")
                Spacer()
                Text("$\(Int(raisedAmount))")
            }
            
            HStack {
                Text("Target")
                Spacer()
                Text("$\(Int(targetAmount))")
            }
            .padding(.top, 5)
            
            ProgressView(value: progress)
                .accentColor(.blue)
                .padding(.vertical, 5)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .shadow(radius: 5)
    }
}

struct ContributionCard_Previews: PreviewProvider {
    static var previews: some View {
        CircleCard(title: "Buy sneakers", raisedAmount: 100, targetAmount: 1000)
            .previewLayout(.sizeThatFits)
    }
}
