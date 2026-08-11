Component({
    properties: {
        item: {
            type: Object,
            value: {}
        },
        index: {
            type: Number,
            value: 0
        },
        // Used for logic that depends on global data or specific page context if needed
        openid: {
            type: String,
            value: ''
        }
    },

    data: {
        // Internal data if needed
    },

    methods: {
        // Handle tap on the whole item
        onItemTap: function (e) {
            this.triggerEvent('itemtap', {
                item: this.data.item,
                index: this.data.index
            });
        },

        // Handle long press on avatar
        onAvatarLongPress: function (e) {
            this.triggerEvent('avatarlongpress', {
                item: this.data.item,
                index: this.data.index
            });
        },

        // Handle topic click
        onTopicTap: function (e) {
            var choosetitle = e.currentTarget.dataset.choosetitle;
            this.triggerEvent('topictap', {
                choosetitle: choosetitle
            });
        },

        // Handle image preview
        previewImg: function (e) {
            var dataset = e.currentTarget.dataset;
            var tp = dataset.tp; // [index, all_images]
            var index = tp[0];
            var images = tp[1];

            wx.previewImage({
                current: images[index],
                urls: images
            });
        },

        // Handle image load success
        imageOnLoad2: function (e) {
            // This might need to update the item data to hide loading spinner
            // Since properties are one-way by default, we might need to handle this carefully
            // or just rely on the parent updating the data.
            // However, for a component, we can maintain local state for loading status if we want.
            // But the original code modifies `item0.ss_xx.tp2[0].loaded`.
            // Let's emit an event for now.
            var index0 = e.currentTarget.dataset.index0;
            var index1 = e.currentTarget.dataset.index1;
            this.triggerEvent('imageload', {
                index0: index0,
                index1: index1
            });
        },

        // Handle image load error
        imageOnLoadError: function (e) {
            var index0 = e.currentTarget.dataset.index0;
            var index1 = e.currentTarget.dataset.index1;
            this.triggerEvent('imageerror', {
                index0: index0,
                index1: index1
            });
        },

        // Handle like tap
        onLikeTap: function (e) {
            this.triggerEvent('like', {
                item: this.data.item,
                index: this.data.index
            });
        },

        // Handle mazhu tap
        onMazhuTap: function (e) {
            this.triggerEvent('mazhu', {
                item: this.data.item,
                index: this.data.index
            });
        }
    }
})
