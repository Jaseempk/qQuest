//
//  RewardsView.swift
//  qQuick
//
//  Created by Hani Atta on 19/10/24.
//

import SwiftUI

struct RewardsView: View {
    var body: some View {
        VStack {
            Text("Rewards Content Goes Here")
                .foregroundColor(.white)
        }
        .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Text("qQuick")
                        .font(.title)
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Image(systemName: "bell")
                        .foregroundColor(.white)
                }
            }
        }
        

}

struct RewardsView_Previews: PreviewProvider {
    static var previews: some View {
        RewardsView()
    }
}
