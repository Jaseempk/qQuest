//
//  ProfileView.swift
//  qQuick
//
//  Created by Hani Atta on 18/10/24.
//

import SwiftUI

struct ProfileView: View {
    var body: some View {
        VStack {
            Text("Profile Content Goes Here")
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

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView()
    }
}
